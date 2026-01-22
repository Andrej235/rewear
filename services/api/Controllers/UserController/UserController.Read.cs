using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.User;

namespace ReWear.Controllers.UserController;

public partial class UserController
{
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserResponseDto>> GetCurrentUser(
        CancellationToken cancellationToken
    )
    {
        var user = await userService.Get(User, cancellationToken);
        if (user.IsFailed)
            return Unauthorized(user.Errors[0].Message);

        return Ok(user.Value);
    }
}
