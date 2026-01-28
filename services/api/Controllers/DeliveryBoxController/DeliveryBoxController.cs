using Microsoft.AspNetCore.Mvc;
using ReWear.Services.ModelServices.DeliveryBoxService;

namespace ReWear.Controllers.DeliveryBoxController;

[Route("delivery-boxes")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class DeliveryBoxController(IDeliveryBoxService service) : ControllerBase;
