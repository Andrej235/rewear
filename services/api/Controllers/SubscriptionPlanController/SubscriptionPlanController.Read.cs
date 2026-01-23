using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.SubscriptionPlan;
using ReWear.Utilities;

namespace ReWear.Controllers.SubscriptionPlanController;

public partial class SubscriptionPlanController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminSubscriptionPlanResponseDto>> Read(
        [FromRoute] int id,
        CancellationToken cancellationToken
    )
    {
        var result = await service.GetById(id, cancellationToken);

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
    public async Task<ActionResult<List<AdminSubscriptionPlanResponseDto>>> ReadAll(
        CancellationToken cancellationToken
    )
    {
        var result = await service.GetAll(cancellationToken);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(result.Value);
    }
}
