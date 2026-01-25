using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Utilities;

namespace ReWear.Controllers.SubscriptionPlanController;

public partial class SubscriptionPlanController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(
        [FromBody] Dtos.Request.SubscriptionPlan.UpdateSubscriptionPlanRequestDto request
    )
    {
        var result = await service.Update(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return NoContent();
    }
}
