using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Resend;
using ReWear.Data;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Dtos.Response.User;
using ReWear.Exceptions;
using ReWear.Models;
using ReWear.Services.ConnectionMapper;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.EmailSender;
using ReWear.Services.Mapping.Request;
using ReWear.Services.Mapping.Request.ClothingItemMappers;
using ReWear.Services.Mapping.Request.InventoryItemMappers;
using ReWear.Services.Mapping.Request.SubscriptionPlanMappers;
using ReWear.Services.Mapping.Response;
using ReWear.Services.Mapping.Response.UserMappers;
using ReWear.Services.ModelServices.ClothingItemService;
using ReWear.Services.ModelServices.InventoryItemService;
using ReWear.Services.ModelServices.SubscriptionPlanService;
using ReWear.Services.ModelServices.TokenService;
using ReWear.Services.ModelServices.UserService;
using ReWear.Services.Read;
using ReWear.Services.Storage;
using ReWear.Services.Update;
using ReWear.Utilities;

var builder = WebApplication.CreateBuilder(args);
var isDevelopment = builder.Environment.IsDevelopment();

if (File.Exists("./secrets.json"))
    builder.Configuration.AddJsonFile("./secrets.json");

var env = builder.Environment;
var keysPath = Path.Combine(env.ContentRootPath, "keys");
Directory.CreateDirectory(keysPath);

builder
    .Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
    .SetApplicationName("ReWear");

var configuration = builder.Configuration;
builder.Services.AddSingleton(configuration);

builder.Services.AddOptions();
builder.Services.AddHttpClient<ResendClient>();
builder.Services.Configure<ResendClientOptions>(options =>
{
    var apiKey = configuration["Resend:ApiKey"];
    if (string.IsNullOrWhiteSpace(apiKey))
        throw new MissingConfigException("Resend API key is null or empty");

    options.ApiToken = apiKey;
});
builder.Services.AddTransient<IResend, ResendClient>();

builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SupportNonNullableReferenceTypes();
    options.SwaggerDoc("v1", new() { Title = "API", Version = "v1" });
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower)
    );
    options.SerializerOptions.RespectNullableAnnotations = true;
});

builder.Logging.ClearProviders().AddConsole();
builder.Services.AddExceptionHandler<ExceptionHandler>();

var connectionString = configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new MissingConfigException("Connection string is null or empty");

builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseNpgsql(connectionString, o => o.UseVector());

    if (isDevelopment)
        options.EnableSensitiveDataLogging();
});

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.UseVector();
await using var dataSource = dataSourceBuilder.Build();

var connection = dataSource.OpenConnection();
await using (var cmd = new NpgsqlCommand("CREATE EXTENSION IF NOT EXISTS vector", connection))
{
    await cmd.ExecuteNonQueryAsync();
}

connection.ReloadTypes();

#region Identity / Auth
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        AuthPolicies.CookieOnly,
        policy =>
        {
            policy.AddAuthenticationSchemes(IdentityConstants.ApplicationScheme);
            policy.RequireAuthenticatedUser();
        }
    );

    options.AddPolicy(
        AuthPolicies.JwtOnly,
        policy =>
        {
            policy.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme);
            policy.RequireAuthenticatedUser();
        }
    );

    options.AddPolicy(
        AuthPolicies.CookieOrJwt,
        policy =>
        {
            policy.AddAuthenticationSchemes(
                IdentityConstants.ApplicationScheme,
                JwtBearerDefaults.AuthenticationScheme
            );
            policy.RequireAuthenticatedUser();
        }
    );

    options.DefaultPolicy = options.GetPolicy(AuthPolicies.CookieOrJwt)!;
});

builder
    .Services.AddIdentity<User, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = true;
        options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._";
        options.Lockout.MaxFailedAccessAttempts = 10;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
        options.SignIn.RequireConfirmedAccount = false;
        options.Tokens.EmailConfirmationTokenProvider = "ShortEmail";
        options.Tokens.PasswordResetTokenProvider = "ShortEmail";
    })
    .AddEntityFrameworkStores<DataContext>()
    .AddDefaultTokenProviders()
    .AddTokenProvider<EmailTokenProvider<User>>("ShortEmail");

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromDays(1);
    options.SlidingExpiration = true;

    if (isDevelopment)
    {
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = SameSiteMode.Lax;
    }
    else
    {
        var domain = configuration["Domain"];
        if (string.IsNullOrWhiteSpace(domain))
            throw new MissingConfigException("Domain is null or empty");

        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.Domain = domain;
    }

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});

builder
    .Services.AddAuthentication()
    .AddJwtBearer(
        JwtBearerDefaults.AuthenticationScheme,
        options =>
        {
            var key = configuration["Jwt:Key"];
            var issuer = configuration["Jwt:Issuer"];
            var audience = configuration["Jwt:Audience"];

            if (
                string.IsNullOrWhiteSpace(key)
                || string.IsNullOrWhiteSpace(issuer)
                || string.IsNullOrWhiteSpace(audience)
            )
                throw new MissingConfigException("Missing JWT configuration");

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = issuer,
                ValidAudience = audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                ClockSkew = TimeSpan.FromSeconds(30),
            };
        }
    );

builder.Services.AddTransient<IEmailSender<User>, EmailSender>();
#endregion

#region Rate limiting
builder.Services.AddRateLimiter(x =>
{
    x.AddTokenBucketLimiter(
        policyName: RateLimitingPolicies.Global,
        options =>
        {
            options.TokenLimit = 10;
            options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            options.QueueLimit = 15;
            options.ReplenishmentPeriod = TimeSpan.FromSeconds(1);
            options.TokensPerPeriod = 2;
            options.AutoReplenishment = true;
        }
    );

    x.AddTokenBucketLimiter(
        policyName: RateLimitingPolicies.EmailConfirmation,
        options =>
        {
            options.TokenLimit = 1;
            options.QueueLimit = 0;
            options.ReplenishmentPeriod = TimeSpan.FromSeconds(60);
            options.TokensPerPeriod = 1;
            options.AutoReplenishment = true;
        }
    );
});
#endregion

#region CORS
var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();
if (allowedOrigins is null || allowedOrigins.Length == 0)
    throw new MissingConfigException("AllowedOrigins is null or empty");

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "WebsitePolicy",
        policyBuilder =>
        {
            policyBuilder
                .WithOrigins(allowedOrigins)
                .AllowCredentials()
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
    );
});
#endregion

#region Model Services

#region User
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IReadSingleService<User>, ReadService<User>>();
builder.Services.AddScoped<IDeleteService<User>, DeleteService<User>>();
builder.Services.AddScoped<IResponseMapper<User, UserResponseDto>, UserResponseMapper>();
#endregion

#region Tokens
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ICreateSingleService<RefreshToken>, CreateService<RefreshToken>>();
builder.Services.AddScoped<IReadSingleService<RefreshToken>, ReadService<RefreshToken>>();
builder.Services.AddScoped<IDeleteService<RefreshToken>, DeleteService<RefreshToken>>();
#endregion

#region SubscriptionPlan
builder.Services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
builder.Services.AddScoped<
    ICreateSingleService<SubscriptionPlan>,
    CreateService<SubscriptionPlan>
>();
builder.Services.AddScoped<
    IReadSingleSelectedService<SubscriptionPlan>,
    ReadService<SubscriptionPlan>
>();
builder.Services.AddScoped<
    IReadRangeSelectedService<SubscriptionPlan>,
    ReadService<SubscriptionPlan>
>();
builder.Services.AddScoped<
    IUpdateSingleService<SubscriptionPlan>,
    UpdateService<SubscriptionPlan>
>();
builder.Services.AddScoped<IDeleteService<SubscriptionPlan>, DeleteService<SubscriptionPlan>>();
builder.Services.AddScoped<
    IRequestMapper<CreateSubscriptionPlanRequestDto, SubscriptionPlan>,
    CreateSubscriptionPlanRequestMapper
>();
builder.Services.AddScoped<
    IRequestMapper<UpdateSubscriptionPlanRequestDto, SubscriptionPlan>,
    UpdateSubscriptionPlanRequestMapper
>();
#endregion

#region ClothingItem
builder.Services.AddScoped<IClothingItemService, ClothingItemService>();
builder.Services.AddScoped<ICreateSingleService<ClothingItem>, CreateService<ClothingItem>>();
builder.Services.AddScoped<IReadSingleSelectedService<ClothingItem>, ReadService<ClothingItem>>();
builder.Services.AddScoped<IReadRangeSelectedService<ClothingItem>, ReadService<ClothingItem>>();
builder.Services.AddScoped<IUpdateSingleService<ClothingItem>, UpdateService<ClothingItem>>();
builder.Services.AddScoped<IExecuteUpdateService<ClothingItem>, UpdateService<ClothingItem>>();
builder.Services.AddScoped<IDeleteService<ClothingItem>, DeleteService<ClothingItem>>();
builder.Services.AddScoped<
    IRequestMapper<CreateClothingItemRequestDto, ClothingItem>,
    CreateClothingItemRequestMapper
>();
builder.Services.AddScoped<
    IRequestMapper<UpdateClothingItemRequestDto, ClothingItem>,
    UpdateClothingItemRequestMapper
>();
#endregion


#region InventoryItem
builder.Services.AddScoped<IInventoryItemService, InventoryItemService>();
builder.Services.AddScoped<ICreateRangeService<InventoryItem>, CreateService<InventoryItem>>();
builder.Services.AddScoped<IReadRangeSelectedService<InventoryItem>, ReadService<InventoryItem>>();
builder.Services.AddScoped<
    IRequestMapper<AddStockRequestDto, IEnumerable<InventoryItem>>,
    AddStockRequestMapper
>();
#endregion

#endregion

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower)
        );
        options.JsonSerializerOptions.RespectNullableAnnotations = true;
    });
;

#region SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<ConnectionMapper>();
#endregion

#region AWS S3
AWSOptions awsOptions = new()
{
    Credentials = new BasicAWSCredentials(
        builder.Configuration["AWS:AccessKey"],
        builder.Configuration["AWS:SecretKey"]
    ),
    Region = Amazon.RegionEndpoint.GetBySystemName(builder.Configuration["AWS:Region"]),
};

builder.Services.AddDefaultAWSOptions(awsOptions);
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<IStorageService, S3StorageService>();
#endregion

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    var roles = new[] { Roles.Admin, Roles.User };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }
}

if (isDevelopment)
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseExceptionHandler("/error");
app.UseRateLimiter();
app.UseCors("WebsitePolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireRateLimiting(RateLimitingPolicies.Global);

app.MapMethods("/", ["HEAD"], () => Results.Ok());

#region Test endpoints
if (isDevelopment)
{
    app.MapGet("test-connection", () => new { status = "OK" })
        .RequireRateLimiting(RateLimitingPolicies.Global);

    app.MapGet("test-auth", () => new { status = "OK" })
        .RequireRateLimiting(RateLimitingPolicies.Global)
        .RequireAuthorization();
}
#endregion

await app.RunAsync();
