package models

type NotificationType string

const (
	NotifFriendRequest    NotificationType = "friend_request"
	NotifFriendAccepted   NotificationType = "friend_accepted"
	NotifItemReserved     NotificationType = "item_reserved"
	NotifWishlistDeadline NotificationType = "wishlist_deadline"
)
