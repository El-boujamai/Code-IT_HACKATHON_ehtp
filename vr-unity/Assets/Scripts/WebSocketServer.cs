using UnityEngine;
using System;
using System.Collections.Generic;
using NativeWebSocket;

public class WebSocketServer : MonoBehaviour
{
    [SerializeField] private string serverUrl = "ws://localhost:5000/unity"; 
    
    private WebSocket webSocket;
    public static WebSocketServer Instance { get; private set; }
    
    public static event Action<string> OnMessageReceived;
    
    // This class helps dispatch events to the main thread
    private class MainThreadQueue
    {
        private readonly Queue<Action> _executionQueue = new Queue<Action>();
        private readonly object _lock = new object();

        public void Enqueue(Action action)
        {
            lock (_lock)
            {
                _executionQueue.Enqueue(action);
            }
        }

        public void Execute()
        {
            lock (_lock)
            {
                while (_executionQueue.Count > 0)
                {
                    _executionQueue.Dequeue()?.Invoke();
                }
            }
        }
    }

    private readonly MainThreadQueue _mainThreadQueue = new MainThreadQueue();
    
    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
    }
    
    async void Start()
    {
        await ConnectToServer();
    }
    
    async System.Threading.Tasks.Task ConnectToServer()
    {
        try
        {
            Debug.Log($"Attempting to connect to WebSocket server at {serverUrl}");
            webSocket = new WebSocket(serverUrl);
            
            webSocket.OnOpen += () => {
                Debug.Log($"Connected to server at {serverUrl}");
                SendRegistration();
            };
            
            webSocket.OnMessage += (bytes) => {
                string message = System.Text.Encoding.UTF8.GetString(bytes);
                Debug.Log($"Message received: {message}");
                
                // Use our simple main thread dispatcher
                _mainThreadQueue.Enqueue(() => {
                    OnMessageReceived?.Invoke(message);
                    
                    // Process specific message types
                    try {
                        var data = JsonUtility.FromJson<MessageWrapper>(message);
                        
                        // Handle the message based on its type
                        if (data != null && data.type == "visualization_data") {
                            Debug.Log("Received visualization data, updating scene...");
                            // Your code to update the visualization would go here
                        }
                    } catch (Exception e) {
                        Debug.LogError($"Error processing message: {e.Message}");
                    }
                });
            };
            
            webSocket.OnError += (e) => {
                Debug.LogError($"WebSocket error: {e}");
            };
            
            webSocket.OnClose += (e) => {
                Debug.Log("Connection closed with code: " + e);
                
                // Try to reconnect after a delay
                _mainThreadQueue.Enqueue(() => {
                    Invoke("AttemptReconnect", 5.0f);
                });
            };
            
            // Start connection
            await webSocket.Connect();
        }
        catch (Exception e)
        {
            Debug.LogError($"WebSocket connection error: {e.Message}");
            Invoke("AttemptReconnect", 5.0f);
        }
    }
    
    void AttemptReconnect()
    {
        Debug.Log("Attempting to reconnect...");
        ConnectToServer();
    }
    
    void SendRegistration()
    {
        if (webSocket.State == WebSocketState.Open)
        {
            // Create a registration message with more detail
            string registrationMsg = JsonUtility.ToJson(new RegistrationMessage {
                type = "register",
                client = "unity",
                version = Application.version,
                platform = Application.platform.ToString()
            });
            
            Debug.Log($"Sending registration: {registrationMsg}");
            webSocket.SendText(registrationMsg);
        }
    }
    
/// <summary>
    /// Sends visualization data to the web frontend via the Node.js server
    /// </summary>
    /// <param name="visualizationData">Data about the current visualization state</param>
    public async void SendVisualizationUpdate(VisualizationData visualData)
    {
        if (webSocket != null && webSocket.State == WebSocketState.Open)
        {
            try
            {
                // Create the message wrapper
                var message = new VisualizationMessage
                {
                    type = "visualization_update",
                    data = visualData
                };
                
                // Convert to JSON and send
                string jsonMessage = JsonUtility.ToJson(message);
                Debug.Log($"Sending visualization update: {jsonMessage}");
                await webSocket.SendText(jsonMessage);
            }
            catch (Exception e)
            {
                Debug.LogError($"Error sending visualization update: {e.Message}");
            }
        }
        else
        {
            Debug.LogWarning("Cannot send visualization update: WebSocket not connected");
        }
    }
    
    // Add these serializable classes for the messages
    [Serializable]
    public class Vector3Data
    {
        public float x;
        public float y;
        public float z;
    }
    
    [Serializable]
    public class VisualizationElement
    {
        public string id;
        public string type;     // e.g., "variable", "function", "loop", "array", etc.
        public string label;
        public Vector3Data position;
        public string state;    // e.g., "active", "inactive", "error", etc.
        public string color;    // Hex color code
    }
    
    [Serializable]
    public class VisualizationData
    {
        public string sessionId;
        public string codeId;
        public VisualizationElement[] elements;
        public string cameraPosition;  // Serialized Vector3 for camera position
        public string userInteraction; // Any user interaction data
    }
    
    [Serializable]
    private class VisualizationMessage
    {
        public string type;
        public VisualizationData data;
    }
    

    public async void SendMessage(string message)
    {
        if (webSocket != null && webSocket.State == WebSocketState.Open)
        {
            await webSocket.SendText(message);
        }
        else
        {
            Debug.LogWarning("Cannot send message: WebSocket not connected");
            // Try to reconnect
            await ConnectToServer();
        }
    }
    
    void Update()
    {
        #if !UNITY_WEBGL || UNITY_EDITOR
        if (webSocket != null)
        {
            webSocket.DispatchMessageQueue();
        }
        #endif
        
        // Execute any queued actions on the main thread
        _mainThreadQueue.Execute();
    }
    
    async void OnDestroy()
    {
        if (webSocket != null)
        {
            await webSocket.Close();
        }
    }
    
    // Message structure classes for serialization/deserialization
    [Serializable]
    private class RegistrationMessage
    {
        public string type;
        public string client;
        public string version;
        public string platform;
    }
    
    [Serializable]
    private class MessageWrapper
    {
        public string type;
        // This is a simple wrapper - real implementation would have more fields
    }
}