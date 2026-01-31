using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.DeliveryBox;
using ReWear.Dtos.Response.DeliveryBox;

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
        [Required] [FromQuery] string size
    )
    {
        var result = await service.AddItemToLatestBox(User, clothingItemId, size);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok();
    }

    [Authorize]
    [HttpDelete("latest/remove-item/{inventoryItemId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> RemoveItemFromLatestBox(Guid inventoryItemId)
    {
        var result = await service.RemoveItem(User, inventoryItemId);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok();
    }

    [Authorize]
    [HttpPatch("latest/change-item-size")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> ChangeItemSizeInLatestBox(
        [FromBody] ChangeBoxItemSizeRequestDto request
    )
    {
        var result = await service.ChangeItemSize(User, request);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok(result.Value);
    }
}
