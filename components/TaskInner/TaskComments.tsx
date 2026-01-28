"use client";

import { ListItem,ListItemAvatar,ListItemText,Avatar, List, Box, Typography, IconButton, Paper, Popover, ListItemIcon, ListItemButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import { MutableRefObject, useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { taskDetailSliceActions } from '@/store/taskDetail-slice';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
import { useDispatch } from 'react-redux';
import { socket } from '@/socket-client';
import { useTypedSettingSelector } from '@/store/settings-slice';

const TaskComments = ({ id, taskData, setCommentText, setDeformedCommentText, inputRef }: { id: string, taskData: Partial<TaskSliceType>, setCommentText: (value: string) => void, setDeformedCommentText: (value: string) => void, inputRef: MutableRefObject<HTMLInputElement | null> }) => {
    const [userInfo,setUserInfo] = useState<UserInfo>({
        userId: "",
        email: "",
        fullName: "",
        role: "",
        title: "",
        accessToken: "",
        avatar: "",
    }); 
    const { comments } = taskData;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const settingsData = useTypedSettingSelector(state => state.settingReducer.taskDetailPageSettings);
    const [selectedPopover, setSelectedPopover] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const open = Boolean(anchorEl);
    const popoverId = open ? 'simple-popover' : undefined;
    const dispatch = useDispatch();
 
    useEffect(() => {
      const userInfo = typeof window !== "undefined" && localStorage.getItem("userInfo") 
        ? JSON.parse(localStorage.getItem("userInfo") || "{}") 
        : {};   
      
      setUserInfo(userInfo);
    }, []);
    
    const handleLikeComment = useCallback(async ({ commentId, type, fullName, userId }: { commentId: string | undefined, type: string, fullName: string, userId: string }) => {
        try {
            dispatch(taskDetailSliceActions.likeComment({ commentId, userId: userInfo.userId, type }));
            
            await axiosPrivate.post(`/api/tasks/${id}/comments/${commentId}`, JSON.stringify({ userId: userInfo.userId, type }), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if(type === 'like' && fullName !== userInfo.fullName) {
                const possibleSendingUsers = settingsData.filter((item) => {
                    if(item && (userId === item.userId)) {
                      return item;
                    }
                });
                  
                const resultUser = possibleSendingUsers.filter((setting) => {
                    if(setting?.notification?.likeComment) {
                      return setting;
                    }
                }).map((item) => {
                    if(item) return item.userId;
                });               
                                
                if(resultUser.length > 0) {
                    socket.emit("likeComment", { userId, fullName, type, message: `${userInfo.fullName} liked your comment!` }); 

                    await axiosPrivate.post('/api/notification', {
                        userId: [...resultUser],
                        fullName, 
                        message: `${userInfo.fullName} liked your comment!`,
                        type: 'likeComment',
                        visibility: 'private',
                        createdAt: new Date().toISOString(),
                    }); 
                }
            }           
        } catch (error) {
            console.log(error);
        }
    }, [userInfo.userId, id, axiosPrivate, dispatch, userInfo.fullName,settingsData]);  
    
    const handleDeleteComment = useCallback(async (commentId: string | undefined) => {
        try {
            if(commentId) {
                await axiosPrivate.delete(`/api/tasks/${id}/comments/${commentId}`);
                dispatch(taskDetailSliceActions.deleteComment(commentId));
            }
        } catch (error) {
            console.log(error);
        }
    }, [axiosPrivate, dispatch, id]);

    const handleReply = useCallback((fullName: string) => {
        if(inputRef.current) {
            inputRef.current.focus();
            window.scrollTo(0,0);
        }
        setCommentText(`@${fullName}`);        
        if(fullName.includes(" ")){
            const newStr = fullName.split(" ").join("*");
            setDeformedCommentText(`@${newStr}`);
        }else{
            setDeformedCommentText(`@${fullName}`);
        }
    }, [setCommentText,setDeformedCommentText,inputRef]);
    
    return (
        <Box className="comment-section-wrapper">
            <List sx={{ p: 2 }}>
                {comments && comments.toSorted((a,b) => new Date(b.adding_at).getTime() - new Date(a.adding_at).getTime()).map((comment) => (
                    <ListItem sx={{ p: 0, mb: 2 }} className='comment-list-item' key={comment._id}>
                        <Paper className='comment-paper'>
                            <ListItemAvatar sx={{ minWidth: '50px' }}>
                                <Avatar src={comment?.avatar} alt="User Name" sx={{ bgcolor: 'primary.main' }}>
                                    {comment?.fullName?.includes(" ") 
                                        ? comment?.fullName?.split(" ").map((name: string) => name[0].toLocaleUpperCase()) 
                                        : comment?.fullName?.slice(0,2).toLocaleUpperCase()
                                    }
                                </Avatar>
                            </ListItemAvatar>
                            <Box className="comment-content">
                                <ListItemText 
                                    secondary={`${moment(comment.adding_at).from(moment(new Date()))}`} 
                                    primary={`${comment.fullName}`} 
                                    className='comment-header-text' 
                                    sx={{ mb: 0 }} 
                                />
                                <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>
                                    <div dangerouslySetInnerHTML={{ __html: comment.description }}></div>
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mt: '8px' }}>
                                    <Typography 
                                        variant='subtitle1' 
                                        sx={{ cursor: 'pointer', color: comment.likes.includes(userInfo.userId) ? 'primary.main' : '#6d6d6b', fontWeight: comment.likes.includes(userInfo.userId) ? 600 : 400 }}
                                        onClick={() => handleLikeComment(comment.likes.includes(userInfo.userId) ? { commentId: comment._id, type: 'dislike', fullName: comment.fullName, userId: comment.userId } : { commentId: comment._id, type: 'like', fullName: comment.fullName, userId: comment.userId })}
                                    >
                                        {comment.likes.length === 0 ? 'Like' : `${comment.likes.length} Likes`} 
                                    </Typography>
                                    <Typography 
                                        variant='subtitle1' 
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => handleReply(comment.fullName)}
                                    >
                                        Reply
                                    </Typography>
                                </Box>

                            </Box>
                            {(comment?.fullName === userInfo.fullName) && <>
                                <IconButton className='more-icon' aria-describedby={id} onClick={(e) => {
                                    setAnchorEl(e.currentTarget);
                                    setSelectedPopover(comment._id ? comment._id : "");
                                }}>
                                    <MoreHorizIcon />
                                </IconButton>
                                <Popover
                                    className='comment-popover'
                                    id={popoverId}
                                    open={selectedPopover === comment._id}
                                    anchorEl={anchorEl}
                                    onClose={() => {
                                        setAnchorEl(null);
                                        setSelectedPopover("");
                                    }}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <List sx={{ pb: '10px', width: '130px' }}>
                                        {/* <ListItem
                                            disablePadding
                                            className="sidebar-list-item"
                                        >
                                            <ListItemButton sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: '40px' }}>
                                                    <VisibilityOffOutlinedIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Gizlət" />
                                            </ListItemButton>
                                        </ListItem> */}
                                        <ListItem
                                            disablePadding
                                            className="sidebar-list-item"
                                            onClick={handleDeleteComment.bind(null, comment._id)}
                                        >
                                            <ListItemButton sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: '40px' }}>
                                                    <DeleteIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Sil" />
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </Popover>
                            </>}
                        </Paper>
                    </ListItem>
                ))}
                {comments?.length === 0 && (
                    <Typography align='center' variant='h6'>There is no comment!</Typography>
                )}
            </List>
        </Box>
    );
};

export default TaskComments;