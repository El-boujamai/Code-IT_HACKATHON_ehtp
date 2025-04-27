using UnityEngine;
using System;
using System.Collections.Generic;

public class MainThreadDispatcher : MonoBehaviour
{
    private static readonly Queue<Action> executionQueue = new Queue<Action>();
    
    public static MainThreadDispatcher Instance { get; private set; }
    
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
        }
    }
    
    public void Enqueue(Action action)
    {
        lock (executionQueue)
        {
            executionQueue.Enqueue(action);
        }
    }
    
    void Update()
    {
        lock (executionQueue)
        {
            while (executionQueue.Count > 0)
            {
                Action action = executionQueue.Dequeue();
                action?.Invoke();
            }
        }
    }
}