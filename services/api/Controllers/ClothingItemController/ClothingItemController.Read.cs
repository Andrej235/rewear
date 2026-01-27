using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.ClothingItem;
using ReWear.Utilities;

namespace ReWear.Controllers.ClothingItemController;

public partial class ClothingItemController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpGet("{id:Guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminClothingItemResponseDto>> Read(
        [FromRoute] Guid id,
        CancellationToken cancellationToken
    )
    {
        var result = await itemService.GetById(id, cancellationToken);

        if (result.IsFailed)
            return NotFound(result.Errors);

        return Ok(result.Value);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<AdminClothingItemResponseDto>>> ReadAll(
        CancellationToken cancellationToken
    )
    {
        var result = await itemService.GetAll(cancellationToken);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }

    [Authorize]
    [HttpGet("previews")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<ClothingItemPreviewResponseDto>>> ReadPreviews(
        CancellationToken cancellationToken,
        [FromQuery] bool onlyInStock = false,
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 25
    )
    {
        var result = await itemService.GetPreviews(
            User,
            onlyInStock,
            offset,
            limit,
            cancellationToken
        );

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }
}
