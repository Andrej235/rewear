using Microsoft.AspNetCore.Mvc;
using ReWear.Services.ModelServices.ClothingItemService;

namespace ReWear.Controllers.ClothingItemController;

[Route("clothing-items")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class ClothingItemController(IClothingItemService service) : ControllerBase;
