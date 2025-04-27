using UnityEngine;
using UnityEngine.InputSystem;

public class SimpleVRInteraction : MonoBehaviour
{
    [SerializeField] private Transform visualizationRoot;
    [SerializeField] private float rotationSpeed = 20f;
    [SerializeField] private float moveSpeed = 2f;
    [SerializeField] private float scaleSpeed = 0.1f;
    
    // Input references
    private Keyboard keyboard;
    
    void Start()
    {
        keyboard = Keyboard.current;
    }
    
    void Update()
    {
        if (visualizationRoot == null || keyboard == null) return;
        
        // Rotate with arrow keys
        if (keyboard.leftArrowKey.isPressed)
            visualizationRoot.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
        if (keyboard.rightArrowKey.isPressed)
            visualizationRoot.Rotate(Vector3.up, -rotationSpeed * Time.deltaTime);
        if (keyboard.upArrowKey.isPressed)
            visualizationRoot.Rotate(Vector3.right, rotationSpeed * Time.deltaTime);
        if (keyboard.downArrowKey.isPressed)
            visualizationRoot.Rotate(Vector3.right, -rotationSpeed * Time.deltaTime);
        
        // Move with WASD
        Vector3 movement = Vector3.zero;
        if (keyboard.wKey.isPressed) movement.z += moveSpeed * Time.deltaTime;
        if (keyboard.sKey.isPressed) movement.z -= moveSpeed * Time.deltaTime;
        if (keyboard.aKey.isPressed) movement.x -= moveSpeed * Time.deltaTime;
        if (keyboard.dKey.isPressed) movement.x += moveSpeed * Time.deltaTime;
        visualizationRoot.position += movement;
        
        // Scale with + and -
        if (keyboard.numpadPlusKey.isPressed || keyboard.equalsKey.isPressed)
            visualizationRoot.localScale += Vector3.one * scaleSpeed * Time.deltaTime;
        if (keyboard.numpadMinusKey.isPressed || keyboard.minusKey.isPressed)
            visualizationRoot.localScale -= Vector3.one * scaleSpeed * Time.deltaTime;
        
        // Ensure scale doesn't go negative
        if (visualizationRoot.localScale.x < 0.1f)
            visualizationRoot.localScale = Vector3.one * 0.1f;
    }
}