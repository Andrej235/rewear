using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReWear.Migrations
{
    /// <inheritdoc />
    public partial class AddIndicesToVecs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserStyleEmbeddings_Embedding",
                table: "UserStyleEmbeddings",
                column: "Embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_ClothingItemEmbeddings_Embedding",
                table: "ClothingItemEmbeddings",
                column: "Embedding")
                .Annotation("Npgsql:IndexMethod", "hnsw")
                .Annotation("Npgsql:IndexOperators", new[] { "vector_cosine_ops" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserStyleEmbeddings_Embedding",
                table: "UserStyleEmbeddings");

            migrationBuilder.DropIndex(
                name: "IX_ClothingItemEmbeddings_Embedding",
                table: "ClothingItemEmbeddings");
        }
    }
}
