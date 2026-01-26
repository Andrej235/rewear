using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.User;

namespace ReWear.Controllers.UserController;

public partial class UserController
{
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await userService.Register(request);

        if (result.IsFailed)
            return BadRequest(new { result.Errors[0].Message });

        return Ok();
    }

    [Authorize]
    [HttpPut("setup-account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> SetupAccount([FromBody] SetupAccountRequestDto request)
    {
        var result = await userService.SetupAccount(User, request);

        if (result.IsFailed)
            return BadRequest(new { result.Errors[0].Message });

        return Ok();
    }
}
