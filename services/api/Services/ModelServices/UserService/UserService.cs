using Microsoft.AspNetCore.Identity;
using ReWear.Data;
using ReWear.Dtos.Response.User;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.Mapping.Response;
using ReWear.Services.ModelServices.TokenService;
using ReWear.Services.ModelServices.UserStyleEmbeddingService;
using ReWear.Services.Read;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService(
    IUserStyleEmbeddingService userStyleEmbeddingService,
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IEmailSender<User> emailSender,
    ITokenService tokenService,
    ICreateRangeService<UserSize> userSizeCreateRangeService,
    ICreateSingleService<UserSubscription> userSubscriptionCreateService,
    IReadSingleService<RefreshToken> tokenReadService,
    IReadSingleSelectedService<User> userReadService,
    IExecuteUpdateService<User> updateService,
    IDeleteService<User> deleteService,
    IDeleteService<RefreshToken> tokenDeleteService,
    IConfiguration configuration,
    DataContext context,
    ILogger<UserService> logger
) : IUserService;
