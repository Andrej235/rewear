using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Models.Enums;
using ReWear.Utilities;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPatch("admin/{boxId:guid}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateBoxStatus(
        [FromRoute] Guid boxId,
        [Required] [FromQuery] DeliveryBoxStatus status
    )
    {
        var result = await service.UpdateStatus(boxId, status);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok();
    }
}
