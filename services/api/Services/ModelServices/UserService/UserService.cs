using Microsoft.AspNetCore.Identity;
using ReWear.Data;
using ReWear.Dtos.Response.User;
using ReWear.Models;
using ReWear.Services.Create;
using ReWear.Services.Delete;
using ReWear.Services.Mapping.Response;
using ReWear.Services.ModelServices.TokenService;
using ReWear.Services.Read;
using ReWear.Services.Update;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IEmailSender<User> emailSender,
    ITokenService tokenService,
    ICreateRangeService<UserSize> userSizeCreateRangeService,
    ICreateSingleService<UserSubscription> userSubscriptionCreateService,
    IReadSingleService<RefreshToken> tokenReadService,
    IReadSingleService<User> userReadService,
    IReadSingleSelectedService<User> userReadSelectedService,
    IExecuteUpdateService<User> updateService,
    IDeleteService<User> deleteService,
    IDeleteService<RefreshToken> tokenDeleteService,
    IResponseMapper<User, UserResponseDto> responseMapper,
    IConfiguration configuration,
    DataContext context,
    ILogger<UserService> logger
) : IUserService;
