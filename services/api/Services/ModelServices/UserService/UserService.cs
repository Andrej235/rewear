using Microsoft.AspNetCore.Identity;
using ReWear.Dtos.Response.User;
using ReWear.Models;
using ReWear.Services.Delete;
using ReWear.Services.Mapping.Response;
using ReWear.Services.ModelServices.TokenService;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IEmailSender<User> emailSender,
    ITokenService tokenService,
    IReadSingleService<RefreshToken> tokenReadService,
    IReadSingleService<User> userReadService,
    IDeleteService<RefreshToken> tokenDeleteService,
    IResponseMapper<User, UserResponseDto> responseMapper,
    IConfiguration configuration
) : IUserService;
