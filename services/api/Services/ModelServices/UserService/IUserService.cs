using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Request.User;
using ReWear.Dtos.Response.User;

namespace ReWear.Services.ModelServices.UserService;

public interface IUserService
{
    Task<Result> Register(RegisterRequestDto request);
    Task<Result> SetupAccount(ClaimsPrincipal claim, SetupAccountRequestDto request);

    Task<Result<TokensResponseDto>> Login(LoginRequestDto request);
    Task<Result<TokensResponseDto>> Refresh(RefreshTokensRequestDto request);
    Task<Result> Logout(LogoutRequestDto request);

    Task<Result> ResendConfirmationEmail(string email);
    Task<Result> ConfirmEmail(ConfirmEmailRequestDto request);

    Task<Result> SendResetPasswordEmail(SendResetPasswordEmailRequestDto request);
    Task<Result> ResetPassword(ResetPasswordRequestDto request);

    Task<Result<IEnumerable<AdminUserResponseDto>>> GetAll(
        int offset,
        int limit,
        CancellationToken cancellationToken
    );
    Task<Result<UserResponseDto>> Get(ClaimsPrincipal claim, CancellationToken cancellationToken);
    Task<Result<FullUserResponseDto>> GetFull(
        ClaimsPrincipal claim,
        CancellationToken cancellationToken
    );

    Task<Result> Delete(string id);

    Task<Result> SetAsUser(string id);
    Task<Result> SetAsAdmin(string id);
}
