using System.ComponentModel.DataAnnotations;

namespace ReWear.Dtos.Request.User;

public class SendResetPasswordEmailRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}
