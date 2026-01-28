using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize]
    [HttpPost("latest/add-item/{clothingItemId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> AddItemToLatestBox(
        Guid clothingItemId,
        [FromQuery] string size,
        CancellationToken ct
    )
    {
        var result = await service.AddItemToLatestBox(User, clothingItemId, size, ct);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok();
    }
}
