using System.Security.Claims;
using FluentResults;
using Template.Dtos.Response.User;
using Template.Errors;
using Template.Services.Read;

namespace Template.Services.ModelServices.UserService;

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
