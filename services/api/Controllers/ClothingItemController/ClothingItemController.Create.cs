using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Dtos.Response.ClothingItem;
using ReWear.Utilities;

namespace ReWear.Controllers.ClothingItemController;

public partial class ClothingItemController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminClothingItemResponseDto>> Create(
        [FromBody] CreateClothingItemRequestDto request
    )
    {
        var result = await service.Create(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Created($"/clothing-items/{result.Value.Id}", result.Value);
    }
}
