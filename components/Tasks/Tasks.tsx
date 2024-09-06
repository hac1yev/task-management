"use client";

import { Box, IconButton, LinearProgress, Typography } from "@mui/material";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import { Item } from "../MaterialSnippets/MaterialSnippets";
import Grid from "@mui/material/Grid2";
import { useTypedTaskSelector } from "@/store/task-slice";
import { useTypedSelector } from "@/store/team-slice";
import { useEffect, useMemo, useState } from "react";
import TaskList from "./TaskList";

const Tasks = () => {
    const allUsers = useTypedSelector(state => state.teamReducer.users);
    const tasks = useTypedTaskSelector(state => state.taskReducer.tasks);
    const [isLoading,setIsLoading] = useState(true);
    const [hideTasks,setHideTasks] = useState({
        todo: 'TODO', inProgress: 'IN PROGRESS', completed: 'COMPLETED'
    });     

    const modifiedTasks = useMemo(() => {
        return tasks.map((task) => {
            const { users } = task;
            const userNames: {
                fullName: string;
                title: string;
                email: string;
            }[] = [];            

            users?.forEach((user) => {
                const findedUser = allUsers.find((u) => user === u._id);
                if(findedUser) {
                    userNames.push({
                        fullName: findedUser?.fullName,
                        title: findedUser.title,
                        email: findedUser.email
                    });
                }
            });
            
            return {
                ...task,
                users: userNames
            }
        });
    }, [allUsers,tasks]);
        
    const todoTasks = useMemo(() => {
        return modifiedTasks.filter(task => {
            if(task.stage === 'TODO') return task;
        });
    }, [modifiedTasks]);

    const inProgressTasks = useMemo(() => {
        return modifiedTasks.filter(task => {
            if(task.stage === 'IN PROGRESS') return task;
        });
    }, [modifiedTasks]);

    const completedTasks = useMemo(() => {
        return modifiedTasks.filter(task => {
            if(task.stage === 'COMPLETED') return task;
        });
    }, [modifiedTasks]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return clearTimeout(timeout);
    }, []);    

    const handleHideShow = (taskStage: string) => {
        if(taskStage === 'TODO') {
            if(hideTasks.todo) {
                setHideTasks((prev) => {
                    return {
                        ...prev,
                        todo: ''
                    }
                })
            }else{
                setHideTasks((prev) => {
                    return {
                        ...prev,
                        todo: taskStage
                    }
                })
            }
        }else if(taskStage === 'IN PROGRESS') {
            if(hideTasks.inProgress) {
                setHideTasks((prev) => {
                    return {
                        ...prev,
                        inProgress: ''
                    }
                })
            }else{
                setHideTasks((prev) => {
                    return {
                        ...prev,
                        inProgress: taskStage
                    }
                })
            }
        }else{
            if(hideTasks.completed) {
                setHideTasks((prev) => {
                    return {
                        ...prev,
                        completed: ''
                    }
                })
            }else{
                setHideTasks((prev) => {
                    return {
                        ...prev,
                        completed: taskStage
                    }
                })
            }
        } 
    };
    
    return (
        <>
            <Grid container spacing={2}>
                <Grid container size={{ xs: 12, sm: 12, md: 4 }} sx={{ flexDirection: 'column' }} className="flex-column-start">
                    <Grid size={12}>
                        <Item className="flex-between" sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Box 
                                    component={"span"} 
                                    sx={{ 
                                        bgcolor: 'primary.main', 
                                        borderRadius: '50%', 
                                        display: 'block', 
                                        height: '16px', 
                                        width: '16px', 
                                    }}></Box>
                                To Do
                            </Box>
                            <IconButton sx={{ p: 0.2 }} onClick={() => handleHideShow("TODO")}>
                                {hideTasks.todo === 'TODO' 
                                    ? <AddOutlinedIcon sx={{ fontSize: '20px' }} /> 
                                    : <RemoveOutlinedIcon sx={{ fontSize: '20px' }} /> }
                            </IconButton>
                        </Item>
                    </Grid>
                    {hideTasks.todo === 'TODO' && ( 
                        <Grid size={12}>
                            {todoTasks.map((task) => (
                                <TaskList  
                                    key={task._id}  
                                    title={task.title}
                                    priority_level={task.priority_level}
                                    users={task.users}
                                    subtask={task.subtask}
                                    created_at={task.created_at}
                                />
                            ))}
                        </Grid>
                    )}
                </Grid>
                <Grid container size={{ xs: 12, sm: 12, md: 4 }} sx={{ flexDirection: 'column' }} className="flex-column-start">
                    <Grid size={12}>
                        <Item className="flex-between" sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Box 
                                    component={"span"} 
                                    sx={{ 
                                        bgcolor: '#D08803', 
                                        borderRadius: '50%', 
                                        display: 'block', 
                                        height: '16px', 
                                        width: '16px', 
                                    }}></Box>
                                In Progress
                            </Box>
                            <IconButton sx={{ p: 0.2 }} onClick={() => handleHideShow("IN PROGRESS")}>
                                {hideTasks.inProgress === 'IN PROGRESS' 
                                    ? <AddOutlinedIcon sx={{ fontSize: '20px' }} /> 
                                    : <RemoveOutlinedIcon sx={{ fontSize: '20px' }} /> }
                            </IconButton>
                        </Item>
                    </Grid>
                    {hideTasks.inProgress === 'IN PROGRESS' && (
                        <Grid size={12}>
                            {inProgressTasks.map((task) => (
                                <TaskList  
                                    key={task._id}  
                                    title={task.title}
                                    priority_level={task.priority_level}
                                    users={task.users}
                                    subtask={task.subtask}
                                    created_at={task.created_at}
                                />
                            ))}   
                        </Grid>
                    )}
                </Grid>
                <Grid container size={{ xs: 12, sm: 12, md: 4 }} sx={{ flexDirection: 'column' }} className="flex-column-start">
                    <Grid size={12}>
                        <Item className="flex-between" sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Box 
                                    component={"span"} 
                                    sx={{ 
                                        bgcolor: '#0C9046', 
                                        borderRadius: '50%', 
                                        display: 'block', 
                                        height: '16px', 
                                        width: '16px', 
                                    }}></Box>
                                Completed
                            </Box>
                            <IconButton sx={{ p: 0.2 }} onClick={() => handleHideShow("COMPLETED")}>
                                {hideTasks.completed === 'COMPLETED' 
                                    ? <AddOutlinedIcon sx={{ fontSize: '20px' }} /> 
                                    : <RemoveOutlinedIcon sx={{ fontSize: '20px' }} /> }
                            </IconButton>
                        </Item>
                    </Grid>
                    {hideTasks.completed === 'COMPLETED' && (
                        <Grid size={12}>
                            {completedTasks.map((task) => (
                                <TaskList 
                                    key={task._id}  
                                    title={task.title}
                                    priority_level={task.priority_level}
                                    users={task.users}
                                    subtask={task.subtask}
                                    created_at={task.created_at}
                                />
                            ))}
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {modifiedTasks.length === 0 && isLoading && (
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
            )}

            {modifiedTasks.length === 0 && !isLoading && (
                <Typography className="flex-center" variant='h6' sx={{ mt: 1 }}>
                    There is no task!
                </Typography>
            )}
        </>
    );
};

export default Tasks;