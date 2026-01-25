using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ReWear.Controllers.ClothingItemController;

public partial class ClothingItemController
{
    [HttpPost("{id:guid}/generate-embedding")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> GenerateEmbedding(Guid id)
    {
        var result = await embeddingService.GenerateEmbedding(id);

        if (result.IsFailed)
            return BadRequest(new { result.Errors[0].Message });

        return Ok();
    }
}
