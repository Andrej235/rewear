using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReWear.Utilities;

namespace ReWear.Controllers.UserController;

public partial class UserController
{
    [Authorize(Roles = Roles.Admin)]
    [HttpPost("{id}/generate-embedding")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> GenerateEmbedding(string id)
    {
        var result = await embeddingService.GenerateEmbedding(id);

        if (result.IsFailed)
            return BadRequest(new { result.Errors[0].Message });

        return Ok();
    }
}
