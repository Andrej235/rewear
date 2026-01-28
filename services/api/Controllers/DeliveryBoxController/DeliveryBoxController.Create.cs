using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Dtos.Response.DeliveryBox;

namespace ReWear.Controllers.DeliveryBoxController;

public partial class DeliveryBoxController
{
    [Authorize]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DeliveryBoxPreviewResponseDto>> Create()
    {
        var result = await service.Create(User);

        if (result.IsFailed)
            return BadRequest(new { result.Errors.First().Message });

        return Created($"/delivery-boxes/latest", result.Value);
    }
}
