using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.User;
using ReWear.Models.Enums;
using ReWear.Utilities;

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

    [Authorize]
    [HttpGet("me/full")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FullUserResponseDto>> GetCurrentUserFull(
        CancellationToken cancellationToken
    )
    {
        var user = await userService.GetFull(User, cancellationToken);
        if (user.IsFailed)
            return Unauthorized(user.Errors[0].Message);

        return Ok(user.Value);
    }

    [Authorize]
    [HttpGet("me/sizes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<UserSizeResponseDto>>> GetCurrentUserSizes(
        [FromQuery] IEnumerable<SizeType> sizeTypes,
        CancellationToken cancellationToken
    )
    {
        var sizes = await userService.GetUserSizes(User, sizeTypes, cancellationToken);

        if (sizes.IsFailed)
            return Unauthorized(sizes.Errors[0].Message);

        return Ok(sizes.Value);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<AdminUserResponseDto>>> GetAll(
        [FromQuery] int offset,
        [FromQuery] int limit,
        CancellationToken cancellationToken
    )
    {
        var result = await userService.GetAll(offset, limit, cancellationToken);

        if (result.IsFailed)
            return BadRequest(new { result.Errors[0].Message });

        return Ok(result.Value);
    }
}
