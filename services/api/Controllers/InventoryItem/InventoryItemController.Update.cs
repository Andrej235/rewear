using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.InventoryItem;
using ReWear.Utilities;

namespace ReWear.Controllers.InventoryItem;

public partial class InventoryItemController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPatch("change-condition")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] ChangeConditionRequestDto request)
    {
        var result = await service.ChangeCondition(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPatch("change-size")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] ChangeSizeRequestDto request)
    {
        var result = await service.ChangeSize(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return NoContent();
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPatch("change-status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update([FromBody] ChangeStatusRequestDto request)
    {
        var result = await service.ChangeStatus(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return NoContent();
    }
}
