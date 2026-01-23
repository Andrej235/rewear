using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Request.SubscriptionPlan;
using ReWear.Dtos.Response.SubscriptionPlan;
using ReWear.Utilities;

namespace ReWear.Controllers.SubscriptionPlanController;

public partial class SubscriptionPlanController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminSubscriptionPlanResponseDto>> Create(
        [FromBody] CreateSubscriptionPlanRequestDto request
    )
    {
        var result = await service.Create(request);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Created($"/subscription-plans/{result.Value.Id}", result.Value);
    }
}
