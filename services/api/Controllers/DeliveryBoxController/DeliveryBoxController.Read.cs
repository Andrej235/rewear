using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.DeliveryBox;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize]
    [HttpGet("previews")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<DeliveryBoxPreviewResponseDto>>> GetPreviews(
        CancellationToken ct
    )
    {
        var result = await service.GetPreviews(User, ct);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }

    [Authorize]
    [HttpGet("latest")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FullDeliveryBoxResponseDto>> GetLatest(CancellationToken ct)
    {
        var result = await service.GetLatest(User, ct);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }
}
