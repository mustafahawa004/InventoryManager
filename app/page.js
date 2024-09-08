'use client'
import { useState, useEffect } from "react";
import { firestore } from '@/firebase';
import { Box, Typography, Stack, TextField, Modal, Button, IconButton, Drawer, useMediaQuery } from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { deleteDoc, setDoc, doc, getDoc, collection, getDocs, query } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false); 
  const [itemName, setItemName] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  
  // useMediaQuery to check screen size (for responsive design)
  const isMobile = useMediaQuery('(max-width: 768px)'); 

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    console.log("Adding item:", item);
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const generateRecipe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: inventory.map(({ name }) => name) }),
      });
      const data = await response.json();
      if (response.ok) {
        setRecipe(data.recipe);
        setIsDrawerOpen(true);  
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true); 
  const handleClose = () => setOpen(false); 

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);  
  };

  const cleanRecipeText = (text) => {
    return text
      .replace(/###/g, '') 
      .replace(/#/g, '') 
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>') 
      .replace(/\*{1,2}(.*?)\*{1,2}/g, '<strong>$1</strong>') 
      .replace(/^- /gm, '') 
      .replace(/\n/g, '<br>'); 
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={2}
      padding={isMobile ? 2 : 4}
    >
      {/* Modal for Adding Item */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bgcolor="white"
          border="2px solid black"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          width={isMobile ? '90%' : '400px'}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Pantry Section */}
      <Box border="1px solid #333" mb={3} width={isMobile ? '100%' : '800px'}>
        <Box
          height="100px"
          bgcolor="#ADD8E6"
          alignItems="center"
          justifyContent="space-between"
          display="flex"
          paddingX={2}
        >
          <Typography variant={isMobile ? "h5" : "h2"} color='#333'>Pantry</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleOpen}>
              <AddIcon />
            </IconButton>
            <IconButton onClick={() => setSearchVisible(!searchVisible)}>
              <SearchIcon />
            </IconButton>
          </Stack>
        </Box>
        {searchVisible && (
          <Box padding={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for an item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
        )}
        <Stack width="100%" height={isMobile ? '200px' : '300px'} spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={isMobile ? 3 : 5}
            >
              <Typography variant={isMobile ? 'h5' : 'h3'} color='#333' textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={isMobile ? 'h5' : 'h3'} color='#333' textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(name);
                  }}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Button to generate the recipe */}
      <Button variant="contained" onClick={generateRecipe} disabled={loading}>
        {loading ? "Generating..." : "Generate Recipe"}
      </Button>

      {/* Recipe Sidebar */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <Box
          width={isMobile ? '300px' : '400px'}
          height="100%"
          p={3}
          bgcolor="#f9f9f9"
          borderRadius="8px"
          boxShadow={3}
          style={{ overflowY: 'auto', lineHeight: 1.6 }}  
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight="bold">
              Generated Recipe
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <hr />
          {recipe && (
            <Box dangerouslySetInnerHTML={{ __html: cleanRecipeText(recipe) }} />
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
