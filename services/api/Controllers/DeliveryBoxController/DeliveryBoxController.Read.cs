using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.DeliveryBox;
using ReWear.Utilities;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize]
    [HttpGet("previews")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<DeliveryBoxPreviewResponseDto>>> GetPreviews(
        CancellationToken ct
    )
    {
        var result = await service.GetPreviews(User, ct);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok(result.Value);
    }

    [Authorize]
    [HttpGet("latest")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FullDeliveryBoxResponseDto>> GetLatest(CancellationToken ct)
    {
        var result = await service.GetLatest(User, ct);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok(result.Value);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("admin/all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<AdminBoxResponseDto>>> GetAllAdmin(
        CancellationToken ct
    )
    {
        var result = await service.GetAllAdmin(ct);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Ok(result.Value);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("admin/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FullAdminBoxResponseDto>> GetByIdAdmin(
        Guid id,
        CancellationToken ct
    )
    {
        var result = await service.GetByIdAdmin(id, ct);

        if (result.IsFailed)
            return NotFound(new { result.Errors.First().Message });

        return Ok(result.Value);
    }
}
