using System.IdentityModel.Tokens.Jwt;
using FluentResults;
using ReWear.Dtos.Request.User;
using ReWear.Dtos.Response.User;
using ReWear.Errors;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService
{
    public async Task<Result<TokensResponseDto>> Login(LoginRequestDto request)
    {
        var user = request.Username.Contains('@')
            ? await userManager.FindByEmailAsync(request.Username)
            : await userManager.FindByNameAsync(request.Username);

        if (
            !request.UseCookies
            && user != null
            && await userManager.CheckPasswordAsync(user, request.Password)
        )
        {
            var accessToken = tokenService.GenerateJwtToken(user);
            var refreshToken = await tokenService.GenerateRefreshToken(user);

            return new TokensResponseDto() { Jwt = accessToken, RefreshToken = refreshToken };
        }

        if (
            request.UseCookies
            && user?.UserName is not null
            && await signInManager.PasswordSignInAsync(user.UserName, request.Password, true, false)
                is { Succeeded: true }
        )
        {
            return Result.Ok();
        }

        return Result.Fail(new Unauthorized());
    }

    public async Task<Result<TokensResponseDto>> Refresh(RefreshTokensRequestDto request)
    {
        var principal = tokenService.GetPrincipalFromExpiredToken(request.Jwt);
        var email = principal
            ?.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Name)
            ?.Value;

        if (email is null)
            return Result.Fail(new BadRequest("Invalid access token"));

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
            return Result.Fail(new Unauthorized());

        var savedRefreshTokenResult = await tokenReadService.Get(t =>
            t.UserId == user.Id && t.Token == request.RefreshToken
        );

        if (savedRefreshTokenResult.IsFailed)
            return Result.Fail(savedRefreshTokenResult.Errors);

        var savedRefreshToken = savedRefreshTokenResult.Value;

        if (savedRefreshToken is null || savedRefreshToken.ExpiresUtc < DateTime.UtcNow)
            return Result.Fail(new BadRequest("Invalid or expired refresh token"));

        var newAccessToken = tokenService.GenerateJwtToken(user);
        var newRefreshToken = await tokenService.GenerateRefreshToken(user, savedRefreshToken);

        return new TokensResponseDto() { Jwt = newAccessToken, RefreshToken = newRefreshToken };
    }

    public Task<Result> Logout(LogoutRequestDto request)
    {
        return tokenDeleteService.Delete(x => x.Token == request.RefreshToken);
    }
}
