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

    [HttpPut("complete-registration")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CompleteRegistrationProcess(
        [FromBody] CompleteRegistrationProcessRequestDto request
    )
    {
        var result = await userService.CompleteRegistrationProcess(request);

        if (result.IsFailed)
            return BadRequest(new { result.Errors[0].Message });

        return Ok();
    }
}
