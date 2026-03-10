using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MakeMeSushi.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedSushisTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompletedSushis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SushiID = table.Column<int>(type: "int", nullable: false),
                    DateCompleted = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompletedSushis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompletedSushis_Sushis_SushiID",
                        column: x => x.SushiID,
                        principalTable: "Sushis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CompletedSushis_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompletedSushis_SushiID",
                table: "CompletedSushis",
                column: "SushiID");

            migrationBuilder.CreateIndex(
                name: "IX_CompletedSushis_UserId",
                table: "CompletedSushis",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompletedSushis");
        }
    }
}
