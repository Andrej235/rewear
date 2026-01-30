using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize]
    [HttpPost("latest/fill-with-ai")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> FillLatestBoxWithAI()
    {
        var result = await service.FillLatestBoxWithAI(User);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok();
    }
}
