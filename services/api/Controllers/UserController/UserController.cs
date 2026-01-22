using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ReWear.Models;
using ReWear.Services.ModelServices.UserService;

namespace ReWear.Controllers.UserController;

[Route("users")]
[ApiController]
[ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
public partial class UserController(IUserService userService, SignInManager<User> signInManager)
    : ControllerBase;
