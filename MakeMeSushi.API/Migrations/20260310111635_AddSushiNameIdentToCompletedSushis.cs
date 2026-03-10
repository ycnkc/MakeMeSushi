using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MakeMeSushi.Migrations
{
    /// <inheritdoc />
    public partial class AddSushiNameIdentToCompletedSushis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SushiName",
                table: "CompletedSushis",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SushiName",
                table: "CompletedSushis");
        }
    }
}
