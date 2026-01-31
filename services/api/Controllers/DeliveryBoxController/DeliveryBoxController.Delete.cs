using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Utilities;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("admin/{boxId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid boxId)
    {
        var result = await service.AdminDelete(boxId);

        if (result.IsFailed)
            return NotFound(new { result.Errors.First().Message });

        return Ok();
    }
}
