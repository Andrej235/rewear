using Microsoft.AspNetCore.Mvc;
using ReWear.Services.ModelServices.ClothingItemEmbeddingService;
using ReWear.Services.ModelServices.ClothingItemService;

namespace ReWear.Controllers.ClothingItemController;

[Route("clothing-items")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class ClothingItemController(
    IClothingItemService itemService,
    IClothingItemEmbeddingService embeddingService
) : ControllerBase;
