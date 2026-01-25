using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Utilities;

namespace ReWear.Controllers.InventoryItem;

public partial class InventoryItemController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> Create([FromBody] AddStockRequestDto request)
    {
        var result = await service.AddStock(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Created($"/clothing-items/{request.ClothingItemId}", null);
    }
}
