using System.Security.Claims;
using FluentResults;
using Template.Dtos.Request.User;
using Template.Dtos.Response.User;

namespace Template.Services.ModelServices.UserService;

public interface IUserService
{
    Task<Result> Register(RegisterRequestDto request);
    Task<Result<TokensResponseDto>> Login(LoginRequestDto request);
    Task<Result<TokensResponseDto>> Refresh(RefreshTokensRequestDto request);
    Task<Result> Logout(LogoutRequestDto request);

    Task<Result> ResendConfirmationEmail(string email);
    Task<Result> ConfirmEmail(ConfirmEmailRequestDto request);

    Task<Result> SendResetPasswordEmail(SendResetPasswordEmailRequestDto request);
    Task<Result> ResetPassword(ResetPasswordRequestDto request);

    Task<Result<UserResponseDto>> Get(ClaimsPrincipal claim, CancellationToken cancellationToken);
}
