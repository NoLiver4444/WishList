package handlers

import (
	"net/http"
	"strconv"
	"wishlist-backend/internal/models"
	"wishlist-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type WishlistHandler struct {
	service *service.WishlistService
}

func NewWishlistHandler(service *service.WishlistService) *WishlistHandler {
	return &WishlistHandler{service: service}
}

func (h *WishlistHandler) Create(c *gin.Context) {
	var req models.CreateWishlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := strconv.ParseInt(c.GetString("userID"), 10, 64)
	
	wishlist := &models.Wishlist{
		UserID:      userID,
		Name:        req.Name,
		Date:        req.Date,
		Description: req.Description,
	}

	if err := h.service.Create(wishlist); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, wishlist)
}

func (h *WishlistHandler) GetAll(c *gin.Context) {
	var req models.GetWishlistsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wishlists, err := h.service.GetAll(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, wishlists)
}

func (h *WishlistHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	wishlist, err := h.service.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "wishlist not found"})
		return
	}

	c.JSON(http.StatusOK, wishlist)
}

func (h *WishlistHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req models.UpdateWishlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated successfully"})
}

func (h *WishlistHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}