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
    public async Task<ActionResult> AddItemToLatestBox(Guid clothingItemId, [FromQuery] string size)
    {
        var result = await service.AddItemToLatestBox(User, clothingItemId, size);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok();
    }

    [Authorize]
    [HttpDelete("latest/remove-item/{inventoryItemId:guid}")]
    public async Task<ActionResult> RemoveItemFromLatestBox(Guid inventoryItemId)
    {
        var result = await service.RemoveItem(User, inventoryItemId);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok();
    }
}
