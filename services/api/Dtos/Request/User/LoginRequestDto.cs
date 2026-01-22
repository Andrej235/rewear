using System.ComponentModel.DataAnnotations;

namespace Template.Dtos.Request.User;

public class LoginRequestDto
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = null!;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = null!;

    [Required]
    public bool UseCookies { get; set; }
}
