using Microsoft.AspNetCore.Mvc;
using ReWear.Services.ModelServices.SubscriptionPlanService;

namespace ReWear.Controllers.SubscriptionPlanController;

[Route("subscription-plans")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class SubscriptionPlanController(ISubscriptionPlanService service) : ControllerBase;
