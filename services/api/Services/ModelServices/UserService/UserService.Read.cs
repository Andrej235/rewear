using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.User;
using ReWear.Errors;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService
{
    public async Task<Result<UserResponseDto>> Get(
        ClaimsPrincipal claim,
        CancellationToken cancellationToken
    )
    {
        var userId = userManager.GetUserId(claim);
        if (userId is null)
            return Result.Fail(new NotFound("User not found"));

        var userResult = await userReadService.Get(x => x.Id == userId);

        if (userResult.IsFailed)
        {
            if (userResult.HasError<NotFound>())
                await signInManager.SignOutAsync();

            return Result.Fail(userResult.Errors);
        }

        return responseMapper.Map(userResult.Value);
    }
}
