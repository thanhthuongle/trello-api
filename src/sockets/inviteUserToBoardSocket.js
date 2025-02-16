export const inviteUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện client gửi lên
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // cách làm đơn giản, nhanh: Emit ngược lại một sự kiện cho mọi client khác( trừ chính client gửi request lên )
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}