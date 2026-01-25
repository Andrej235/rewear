using Microsoft.AspNetCore.Mvc;
using ReWear.Services.ModelServices.InventoryItemService;

namespace ReWear.Controllers.InventoryItem;

[Route("inventory-items")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class InventoryItemController(IInventoryItemService service) : ControllerBase;
