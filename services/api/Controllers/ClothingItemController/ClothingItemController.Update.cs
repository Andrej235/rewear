using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.ClothingItem;
using ReWear.Utilities;

namespace ReWear.Controllers.ClothingItemController;

public partial class ClothingItemController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] UpdateClothingItemRequestDto request)
    {
        var result = await service.Update(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPatch("{id:guid}/image")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateImage(Guid id, IFormFile imageStream)
    {
        var result = await service.UpdateImage(id, imageStream);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return NoContent();
    }
}
