using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.User;
using ReWear.Dtos.Response.User;
using ReWear.Utilities;

namespace ReWear.Controllers.UserController;

public partial class UserController
{
    [Authorize]
    [HttpGet("check-auth")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public Task<OkResult> CheckAuth() => Task.FromResult(Ok());

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("check-auth-admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public Task<OkResult> CheckAuthAdmin() => Task.FromResult(Ok());

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TokensResponseDto?>> Login([FromBody] LoginRequestDto request)
    {
        var result = await userService.Login(request);

        if (result.IsFailed)
            return BadRequest(new { Message = "Invalid username or password" });

        return Ok(result.Value);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TokensResponseDto>> Refresh(
        [FromBody] RefreshTokensRequestDto request
    )
    {
        var result = await userService.Refresh(request);

        if (result.IsFailed)
            return BadRequest(result.Errors[0]);

        return Ok(result.Value);
    }

    [Authorize(Policy = AuthPolicies.CookieOnly)]
    [HttpPost("logout/cookie")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> LogoutCookie()
    {
        await signInManager.SignOutAsync();
        return Ok();
    }

    [Authorize(Policy = AuthPolicies.JwtOnly)]
    [HttpPost("logout/token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> LogoutToken([FromBody] LogoutRequestDto request)
    {
        await userService.Logout(request);
        return Ok();
    }
}
