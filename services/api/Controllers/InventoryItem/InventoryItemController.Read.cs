using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.InventoryItem;
using ReWear.Utilities;

namespace ReWear.Controllers.InventoryItem;

public partial class InventoryItemController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpGet("{clothingItemId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<AdminInventoryItemResponseDto>>> ReadAll(
        [FromRoute] Guid clothingItemId,
        CancellationToken cancellationToken
    )
    {
        var result = await service.GetFor(clothingItemId, cancellationToken);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }
}
