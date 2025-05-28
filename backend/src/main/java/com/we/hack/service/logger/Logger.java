package com.we.hack.service.logger;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class Logger {
    private static Logger instance;
    private Queue<String> log;
    private int SIZE;

    private Logger(int size) throws IOException {
        logLoad();
        SIZE = size;
        log = new LinkedList<>();
    }

    public static Logger getInstance(int size) throws IOException {
        if(instance == null) {
            instance = new Logger(size);
        }
        return instance;
    }

    private void logLoad() throws IOException {
        SimpleDateFormat ft
                = new SimpleDateFormat("dd-MM-yyyy");
        String fileName = "logs/log_"+ft.format(new Date());
        try {
            BufferedReader reader = new BufferedReader(new FileReader(fileName));
            for(String line = reader.readLine(); line != null; line = reader.readLine()) {
                log.add(line);
            }
        } catch (FileNotFoundException e) {
            System.out.println("File not found");
            File f = new File(fileName);
            if (f.createNewFile())
                System.out.println("New File created");
        }
    }

    private boolean isFull() {
        if(log.size() == SIZE){
            return true;
        }
        return false;
    }

    private void shiftLog(){
        if(isFull()) {
            log.remove();
        }
    }

    private void writeLog(){
        SimpleDateFormat ft
                = new SimpleDateFormat("dd-MM-yyyy");
        String fileName = "logs/log_"+ft.format(new Date());
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName, false))) {
            while (!log.isEmpty()) {
                writer.write(log.poll());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("An error occurred while writing to the file: " + e.getMessage());
        }
    }

    public void INFO(String msg){
        shiftLog();
        String temp = "[INFO] "+msg;
        log.add(temp);
        writeLog();
    }

    public void WARN(String msg){
        shiftLog();
        String temp = "[WARN] "+msg;
        log.add(temp);
        writeLog();
    }

    public void ERROR(String msg){
        shiftLog();
        String temp = "[ERROR] "+msg;
        log.add(temp);
        writeLog();
    }

    public void SEVERE(String msg){
        shiftLog();
        String temp = "[SEVERE] "+msg;
        log.add(temp);
        writeLog();
    }

    public void DEBUG(String msg){
        shiftLog();
        String temp = "[DEBUG] "+msg;
        log.add(temp);
        System.out.println("[DEBUG] "+msg);
        writeLog();
    }
}
